import lf from 'lovefield';

/* DATABSE SETUP */
/* ============= */

var primarySchemaBuilder = lf.schema.create('datastore', 2);

primarySchemaBuilder.createTable('Pages')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('domain', lf.Type.STRING)
  .addColumn('hostname', lf.Type.STRING)
  .addColumn('path', lf.Type.STRING)
  .addColumn('protocol', lf.Type.STRING)
  .addPrimaryKey(['id']);

primarySchemaBuilder.createTable('Trackers')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('tracker', lf.Type.STRING) // company name
  .addColumn('pageId', lf.Type.INTEGER)
  .addPrimaryKey(['id'], true)
  .addForeignKey('fk_pageId', {
    local: 'pageId',
    ref: 'Pages.id'
  });

primarySchemaBuilder.createTable('Inferences')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('inference', lf.Type.STRING)
  .addColumn('inferenceCategory', lf.Type.STRING)
  .addColumn('pageId', lf.Type.INTEGER)
  .addColumn('threshold', lf.Type.NUMBER)
  .addPrimaryKey(['id'], true)
  .addForeignKey('fk_pageId', {
    local: 'pageId',
    ref: 'Pages.id'
  })
  .addIndex('idxThreshold', ['threshold'], false, lf.Order.DESC);

let primaryDbPromise = primarySchemaBuilder.connect({storeType: lf.schema.DataStoreType.INDEXED_DB});

export {primaryDbPromise, primarySchemaBuilder};
