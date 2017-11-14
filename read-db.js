const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('_todos-server_tests');

function getDocument() {
  db.get('0h840a').then( (doc) => {
    console.log(`Project found: ${doc}`);
  }).catch( (err) => {
    console.log(`ERROR: ${err}`);
  })
}

function getDBInfo() {
  db.info().then( (info) => {
    console.log(`Info found: ${JSON.stringify(info, null, 2)}`);
  }).catch( (err) => {
    console.log(`ERROR: ${err}`);
  })
}

function getAllDocuments() {
  return db.allDocs({
    include_docs: true
  })
}

function extractKeyFromLink(link) {
  return link.match(/([A-Z])\w+/)[0];
}

function giveKeyToAllFilledDocs() {
  getAllDocuments().then( (result) => {
    const updatedResults = result.rows.filter( (item) => {
      return item.doc.link && item.doc.link.length;
    }).map( (itemWithLink) => {
      return {
        "_id": itemWithLink.doc._id,
        "_rev": itemWithLink.doc._rev,
        "text": itemWithLink.doc.text,
        "stashKey": extractKeyFromLink(itemWithLink.doc.link),
        "link": itemWithLink.doc.link
      }
    })

    console.log(`Updated ${updatedResults.length} projects`);

    return db.bulkDocs(updatedResults).then(function (result) {
      console.log(`Update finished with results ${result}`);
    }).catch(function (err) {
      console.log(`ERROR: ${err}`);
    });
    
  }).catch( (err) => {
    console.log(`ERROR: ${err}`);
  })
}

function replicate_database() {
  PouchDB.replicate('_todos-server_replica', '_todos-server_tests')
  .on('change', function (info) {
    console.log('change');
  }).on('paused', function (err) {
    console.log('paused');
  }).on('active', function () {
    console.log('active');
  }).on('denied', function (err) {
    console.log('denied');
  }).on('complete', function (info) {
    console.log('complete');
  }).on('error', function (err) {
    console.log(`ERROR: ${err}`);
  });

}

// replicate_database();
giveKeyToAllFilledDocs();