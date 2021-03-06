
const airtable = require('./airtable.js')
const _ = require('lodash')
/* eslint-disable camelcase */

const requiredParam = param => {
  const requiredParamError = new Error(`Required parameter, "${param}" is missing.`)
  // preserve original stack trace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(requiredParamError, requiredParam)
  }
  throw requiredParamError
}

const updateMember = async ({ id, name, phone }) => {
  
  return airtable.updateRecord({ table: 'member', id, data: { fields: { name, phone} } })
}

const toMember = record => {
  const { no, name, phone, line_id } = record.fields
  return {
    id: record.id,
    no,
    name,
    phone,
    
    line_id
  }
}

module.exports.createMember = async ({
  id,
  lineID = requiredParam('lineID'),
  name,
  phone
} = {}) => {
  name = _.trim(name)
  phone = _.trim(phone)
  console.log(`record id: ${id}`)
  const filterByFormula = id ? `OR((RECORD_ID() = '${id}'), ({line_id} = '${lineID}'))` : `{line_id} = '${lineID}'`
  console.log(filterByFormula)
  const memberResult = await airtable.getRecords({ table: 'member', filterByFormula })
  const members = _.map(memberResult.records, toMember)
  if (members.length > 1) return console.log(`發現雙胞胎啦! id: ${id}, lineID: ${lineID}, records: ${JSON.stringify(members)}`)
  if (members.length === 1) {
    console.log(`updatingMember`)
    return updateMember({ id, name, phone})
  }
  const newMember = await airtable.createRecord({ table: 'member', data: { fields: { line_id: lineID, name, phone} } })
  newMember.fields.id = newMember.id
  return newMember.fields
}
