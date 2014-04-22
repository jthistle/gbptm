#! /bin/bash
../../cli/fetch -f ../fetchers/kml http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
 ../../cli/transform -t ../transformers/geo_hash_id.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
../../cli/transform -t ../transformers/attribute.js attribution 'Salford City Council' \
 | \
 ../../cli/write -f ../writers/upsert_mongo loos