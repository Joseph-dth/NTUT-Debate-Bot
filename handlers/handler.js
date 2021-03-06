const _ = require('lodash')
const { LineHandler } = require('bottender')
const queryString = require('query-string')
const handleGeneralFlow = require('./handle_general_flow.js')
const handleShoppingFlow = require('./handle_shopping_flow.js')
const handleMemberFlow = require('./handle_member_flow')
const handleUpdateMember = require('./handle_memberInfo_flow')

const init = context => {
  const { event } = context
  console.log(`\n`)
  if (event.isText) console.log(`handler, user input: ${event.text}`)
  if (event.isPostback) {
    console.log(`handler, user postback: ${JSON.stringify(event.postback)}`)
    event.postback['query'] = queryString.parse(event.postback.data)
    console.log('handler, postback.query:', event.postback.query)
  }
  console.log(`handler, first state: `, context.state)
  return false
}

const isReset = context => {
  const { event } = context
  if (event.isText && (event.text === 'Reset' || event.text === 'Reset ')) {
    console.log(`handler, isReset`)
    return true
  }
  return false
}

const handleReset = context => {
  context.resetState()
  console.log(`handler, handleReset: reset state`)
  context.replyText('已重置')
  console.log(`handler, reply 已重置`)
  console.log(`handler, final state: `, context.state)
}

const isGeneralFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'general') {
      console.log(`handler, handler, isGeneralFlow, true`)
      return true
    }
  }
  return false
}

const isShoppingFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'shopping') {
      console.log(`handler, isShoppingFlow, true`)
      return true
    }
  }
  if (_.startsWith(context.state.flow, 'shopping')) {
    console.log(`handler, isShoppingFlow, true`)
    return true
  }
  return false
}

const isMemberFlow = context => {
const { event } = context
  if (_.startsWith(context.state.flow, 'member')) {
    console.log(`handler, isMemberFlow, true`)
    return true
  }
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'member') {
      console.log(`handler, isMemberFlow, true`)
      return true
    }
  }
  return false
}

const isUpdateMember = context =>{
  const { event } = context
  if(_.startsWith(context.state.flow, 'updateMember')){
    console.log(`handler, isMemberUpdate, true`)
    return true
  }
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'updateMember') {
      console.log(`handler, isUpdateMemberFlow, true`)
      return true
    }
  }
  return false
}

module.exports = new LineHandler()
  .on(init, context => console.log(`How do you get here!?`))
  // TODO: move here
  .on(isReset, handleReset)
  .on(isGeneralFlow, handleGeneralFlow)
  .on(isShoppingFlow, handleShoppingFlow)
  .on(isMemberFlow, handleMemberFlow)
  .on(isUpdateMember, handleUpdateMember)
  .onEvent(context => {
    if (context.event.isText) return
    console.log('handler, uncaught event:', context.event.rawEvent)
  })
  .build()
