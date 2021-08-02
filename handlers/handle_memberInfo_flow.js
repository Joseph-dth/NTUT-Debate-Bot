const { LineHandler } = require('bottender')
const Member = require('../database/member.js')

const isUpdateMember = context =>{
  const {event} = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'updateMember') {
    console.log('handle_memberUpdate_flow, isNewMember, true')
    return true
    }
    return false
}

const handleUpdateMember = async context =>{
  console.log('handle_updateMember_flow, handleUpdateMember')
  context.state.flow = 'updateMember_wait_input_name'
  
  await context.pushText('好的！請問您的姓名是？')
  console.log('handle_memberUpdate_flow, reply ask name')
  console.log('handle_memberUpdate_flow, final state: ', context.state)
}
const isWaitInputName = context => {
  if (context.state.flow === 'updateMember_wait_input_name') {
  console.log('handle_memberUpdate_flow, isWaitInputName, true')
  return true
  }
  return false
}
  
const handleWaitInputName = async context => {
  const { event } = context
  console.log('handle_updateMember_flow, handleWaitInputName')
  context.state.member.name = null
  context.state.member.phone = null
  context.state.member.name = event.text
  await context.replyText('好的！')
  await context.pushText('請問您的手機號碼是？')
  context.state.flow = 'updateMember_wait_input_phone'
  console.log('handle_member_flow, reply ask phone number')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitInputPhone = context => {
  if (context.state.flow === 'updateMember_wait_input_phone') {
  console.log('handle_member_flow, isWaitInputPhone, true')
  return true
  }
  return false
}
  
const handleWaitInputPhone = async context => {
  console.log('handle_updateMember_flow, handleWaitInputPhone')
  const { event } = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.phone = event.text  
  console.log('handle_updateMember_flow, final state: ', context.state)
  context.state.flow = null
  context.state.member.lineID = context.session.user.id
  await context.replyText('會員資訊已更新！')
  return Member.createMember(context.state.member)
  
}






module.exports = new LineHandler()
    .on(isUpdateMember, handleUpdateMember)
    .on(isWaitInputName, handleWaitInputName)
    .on(isWaitInputPhone, handleWaitInputPhone)