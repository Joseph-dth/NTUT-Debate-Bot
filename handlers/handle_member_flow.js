const shopping = require('./handle_shopping_flow.js')
const { LineHandler } = require('bottender')
const Member = require('../database/member.js')
const updateMember = require('./handle_memberInfo_flow.js')

const isNewMember = context => {
  if (!context.state.member) {
    console.log('handle_member_flow, isNewMember, true')
    return true
  }
  return false
}

const handleNewMember = async context => {
  console.log('handle_member_flow, handleNewMember')
  context.state.member = {}
  context.state.flow = 'member_wait_input_name'
  await context.pushText('Ops～您似乎還沒註冊過唷，可能要麻煩您留一下您的聯絡資訊喔!')
  await context.pushText('請問您的姓名是？')
  console.log('handle_member_flow, reply ask name')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitInputName = context => {
  if (context.state.flow === 'member_wait_input_name') {
    console.log('handle_member_flow, isWaitInputName, true')
    return true
  }
  return false
}

const handleWaitInputName = async context => {
  const { event } = context
  console.log('handle_member_flow, handleWaitInputName')
  context.state.member.name = event.text
  
  await context.replyText('好的！')
  await context.pushText('請問您的手機號碼是？')
  context.state.flow = 'member_wait_input_phone'
  console.log('handle_member_flow, reply ask phone number')
  console.log('handle_member_flow, final state: ', context.state)
  }


const isWaitInputPhone = context => {
  if (context.state.flow === 'member_wait_input_phone') {
    console.log('handle_member_flow, isWaitInputPhone, true')
    return true
  }
  return false
}

const handleWaitInputPhone = async context => {
  console.log('handle_member_flow, handleWaitInputPhone')
  const { event } = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.phone = event.text
  
  
  
  context.state.flow = null
  await context.reply([
    {
      type: 'template',
      altText: '～',
      template: {
        type: 'buttons',
        thumbnailImageUrl: 'https://i.imgur.com/dvYQD8J.jpg',
        imageBackgroundColor: '#FFFFFF',
        title: '聯絡資訊如下，我有記錯嗎？',
        text: `姓名：${context.state.member.name}
手機：${context.state.member.phone}
沒錯吧？`,
        actions: [
          {
            type: 'postback',
            label: '沒錯！',
            displayText: '沒錯！',
            data: `flow=member&action=confirm`
          }, {
            type: 'postback',
            label: '不對唷～給我重來！',
            displayText: '不對唷～給我重來！',
            data: `flow=member&action=tryAgain`
          },
          {
            type: 'postback',
            label: '算了～下次吧～',
            displayText: '算了～下次吧～',
            data: `flow=member&action=cancelOrder`
          }
        ]
      } }])
  console.log('handle_member_flow, reply ask confirm')
  console.log('handle_member_flow, final state: ', context.state)
}


const isWaitConfirm = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.flow === 'member') {
    console.log('handle_member_flow, isWaitConfirm, true')
    return true
  }
  return false
}

const isConfirm = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'confirm') {
    console.log('handle_member_flow, isConfirm, true')
    return true
  }
  return false
}

const handleConfirm = async context => {
  console.log('handle_member_flow, handleConfirm')
  context.state.flow = null
  context.replyText('會員資訊已確認囉!')
  context.state.member.lineID = context.session.user.id
  const newMember = await Member.createMember(context.state.member)
  if (newMember) {
    context.state.member = newMember
  }
  console.log('handle_member_flow, reply member info confirm')
  console.log('handle_member_flow, final state: ', context.state)
  if (context.state.order){
  context.state.flow = 'shopping_wait_confirm' 
  return shopping(context)
  }
}

const isTryAgain = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'tryAgain') {
    console.log('handle_member_flow, isTryAgain, true')
    return true
  }
  return false
}

const handleTryAgain = context => {
  console.log('handle_member_flow, handleTryAgain')
  context.state.flow = 'member_wait_input_name'
  context.replyText('真不好意思>"<，請問您的姓名是')
  console.log('handle_member_flow, reply ask name again')
  console.log('handle_member_flow, final state: ', context.state)
}

const isCancelOrder = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'cancelOrder') {
    console.log('handle_member_flow, isCancelOrder, true')
    return true
  }
  return false
}

const handleCancelOrder = context => {
  console.log('handle_member_flow, handleCancelOrder')
  context.replyText('嗚嗚～好的')
  context.resetState()
  console.log('handle_member_flow, reply confirm cancel order')
  console.log('handle_member_flow, final state: ', context.state)
}



const handleWaitConfirm = new LineHandler()
  .on(isConfirm, handleConfirm)
  .on(isTryAgain, handleTryAgain)
  .on(isCancelOrder, handleCancelOrder)






module.exports = new LineHandler()
  .on(isNewMember, handleNewMember)
  
  .on(isWaitInputName, handleWaitInputName)
  .on(isWaitInputPhone, handleWaitInputPhone)
  .on(isWaitConfirm, handleWaitConfirm)
  
  .onEvent(context => console.log('handle_member_flow, uncaught event:', context.event.rawEvent))
  .build()
