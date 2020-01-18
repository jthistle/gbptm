import { gql } from '@apollo/client';

const resolvers = {
  Mutation: {
    updateCenter: (_root, { lat, lng }, { cache }) => {
      const query = gql`
        query mapCenter {
          mapControls @client {
            center {
              lat
              lng
            }
            viewMap
          }
        }
      `;

      const { mapControls } = cache.readQuery({ query });
      console.log('map controls seem to be:',mapControls);

      console.log('mutate update center:', lat, lng);

      const data = {
        mapControls: {
          center: {
            lat,
            lng,
          },
        },
      };

      cache.writeQuery({ query, data });

      return true;
    },
    updateZoom: (_root, { zoom }, { cache }) => {
      return true;

      console.log('mutate update zoom:', zoom);
      const newData = {
        mapControls: {
          zoom,
        },
      };
      cache.writeData({
        data: newData,
      });
      console.log('done update zoom');
      return true;
    },
    toggleViewMode: (_root, vars, { cache }) => {
      return true;

      console.log('toggle view mode');
      const { mapControls } = cache.readQuery({
        query: gql`
          {
            mapControls {
              viewMap
            }
          }
        `,
      });
      const newData = {
        mapControls: {
          viewMap: !mapControls.viewMap,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
    loginUser: (_root, { name }, { cache }) => {
      return true;

      const newData = {
        userData: {
          name,
          loggedIn: true,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
    logoutUser: (_root, vars, { cache }) => {
      return true;

      const newData = {
        userData: {
          name: null,
          loggedIn: false,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
  },
};

// No validation is done with this, but it allows us an overview of how
// we are handling the local state
const typeDefs = gql`
  extend type Query {
    mapControls: MapControls!
    userData: UserData!
  }

  extend type Mutation {
    updateCenter(lat: Number!, lng: Number!): Boolean
    updateZoom(zoom: Number!): Boolean
    toggleViewMode: Boolean
    loginUser(name: String!): Boolean
    logoutUser: Boolean
  }

  type MapControls {
    zoom: Number!
    center: Point!
    viewMap: Boolean!
  }

  type Point {
    lat: Number!
    lng: Number!
  }

  type UserData {
    loggedIn: Boolean!
    name: String
  }
`;

export default {
  resolvers,
  typeDefs,
};
