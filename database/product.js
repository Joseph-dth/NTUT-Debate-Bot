const airtable = require('./airtable.js')
const _ = require('lodash')
/* eslint-disable camelcase */
const toProduct = record => {
  const { fields } = record
  const { name, detail, images, is_show , url} = fields
  if (!(name && detail && images && images[0].url)) return console.log(`Some data in product id: ${record.id} is not correct`)
  return { id: record.id, name, detail, imgUrl: images[0].url, isShow: is_show , url: url} // Fix id to id: record.id
}

module.exports.readProducts = async ({ offset } = {}) => {
  let result = await airtable.getRecords({
    table: 'product',
    offset,
    pageSize: 9,
    sort: [{ field: 'id', direction: 'asc' }]
  })
  result['products'] = _.compact(_.map(result.records, toProduct))
  return result
}

module.exports.readProduct = async ({ id } = {}) => {
  let result = await airtable.getRecord({ table: 'product', id })
  return toProduct(result)
}
