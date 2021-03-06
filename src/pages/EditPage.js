import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/client';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import LooMap from '../components/LooMap';
import EntryForm from '../components/EntryForm';
import useNearbyLoos from '../components/useNearbyLoos';
import useMapPosition from '../components/useMapPosition';

import config from '../config';
import graphqlMappings from '../graphqlMappings';
import history from '../history';
import questionnaireMap from '../questionnaireMap';

import controls from '../css/controls.module.css';

const FIND_BY_ID = loader('./findLooById.graphql');
const UPDATE_LOO = loader('./updateLoo.graphql');

const EditPage = (props) => {
  const optionsMap = graphqlMappings.looProps.definitions;

  // find the raw loo data for the given loo
  const { loading: loadingLooData, data: looData, error: looError } = useQuery(
    FIND_BY_ID,
    {
      variables: {
        id: props.match.params.id,
      },
    }
  );

  const [mapPosition, setMapPosition] = useMapPosition();

  const looLocation = (looData && looData.loo.location) || null;

  // Set the map position to the loo location
  React.useEffect(() => {
    if (looLocation) {
      console.log('setting initial location:', looLocation);
      setMapPosition({ center: looLocation });
    }
  }, [looLocation, setMapPosition]);

  const { data } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
  });

  // local state mapCenter to get fix issues with react-leaflet not being stateless and lat lng rounding issues
  const [mapCenter, setMapCenter] = useState();

  const [initialData, setInitialData] = useState();

  useEffect(() => {
    if (!looData) {
      return;
    }

    let tempLoo = {
      active: null,
      name: '',
      access: '',
      type: '',
      accessibleType: '',
      opening: '',
      notes: '',
      fee: '',
    };

    // set questionnaire loo property defaults
    questionnaireMap.forEach((q) => {
      tempLoo[q.property] = '';
    });

    // deep extend loo state to ensure we get all properties (since we can't guarantee
    // that `looData` will include them all)
    const newLoo = cloneDeep(merge({}, tempLoo, looData.loo));
    setMapCenter(newLoo.location);

    // keep track of defaults so we only submit new information
    setInitialData({
      loo: newLoo,
      center: {
        lat: newLoo.location.lat,
        lng: newLoo.location.lng,
      },
    });
  }, [looData]);

  const [
    updateLoo,
    { loading: saveLoading, data: saveResponse, error: saveError },
  ] = useMutation(UPDATE_LOO);

  if (saveError) {
    console.error('error saving:', saveError);
  }

  // redirect to thanks page if successfully made changes
  if (saveResponse && saveResponse.submitReport.code === '200') {
    history.push(`/loos/${saveResponse.submitReport.loo.id}/thanks`);
  }

  const save = (data) => {
    const id = looData.loo.id;

    updateLoo({
      variables: {
        ...data,
        id,
      },
    });
  };

  const getLoosToDisplay = () => {
    let activeLoo;

    if (looData) {
      activeLoo = {
        ...looData.loo,
        isHighlighted: true,
      };
    }

    // only return the active loos once (activeLoo must be first in array)
    return uniqBy([activeLoo, ...data], 'id').filter(Boolean);
  };

  if (loadingLooData || !looData || !initialData) {
    return (
      <PageLayout
        main={<Loading message="Fetching Toilet Data" />}
        map={<Loading message="Fetching Toilet Data" />}
      />
    );
  }

  if (looError) {
    console.error(looError);

    return (
      <PageLayout
        main={<Loading message="Error fetching toilet data" />}
        map={<Loading message="Error fetching toilet data" />}
      />
    );
  }

  // redirect to index if loo is not active (i.e. removed)
  if (looData && !looData.loo.active) {
    history.push(`/`);
  }

  const mapFragment = looLocation ? (
    <LooMap
      loos={getLoosToDisplay()}
      center={mapPosition.center}
      zoom={mapPosition.zoom}
      minZoom={config.editMinZoom}
      onViewportChanged={(mapPosition) => {
        setMapCenter(mapPosition.center);
        setMapPosition(mapPosition);
      }}
      showCenter
      showSearchControl
    />
  ) : null;

  const mainFragment = (
    <EntryForm
      map={mapFragment}
      loo={initialData.loo}
      center={mapCenter}
      questionnaireMap={questionnaireMap}
      saveLoading={saveLoading}
      saveResponse={saveResponse}
      saveError={saveError}
      optionsMap={optionsMap}
      onSubmit={save}
    >
      {({ hasDirtyFields }) => (
        <>
          <input
            type="submit"
            className={controls.btn}
            value="Update the toilet"
            disabled={!hasDirtyFields}
          />

          <Link
            to={`/loos/${props.match.params.id}/remove`}
            className={controls.btnCaution}
          >
            Remove the toilet
          </Link>
        </>
      )}
    </EntryForm>
  );

  return <PageLayout main={mainFragment} map={mapFragment} />;
};

export default EditPage;
