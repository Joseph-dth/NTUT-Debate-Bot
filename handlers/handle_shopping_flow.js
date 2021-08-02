const { LineHandler } = require('bottender')
const _ = require('lodash')
const Product = require('../database/product.js')
const handleMemberFlow = require('./handle_member_flow.js')
const Order = require('../database/order.js')

const isBuy = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'buy') {
    console.log('handle_shopping_flow, isBuy, true')
    return true
  }
  return false
}

const handleBuy = async context => {
  console.log('handle_shopping_flow, handleBuy')
  const { productID } = context.event.postback.query
  if (!productID) return console.log('there is no productID in postback!')
  const product = await Product.readProduct({ id: productID })
  if (!product || !product.isShow) return context.replyText('不好意思，已經額滿囉')
  
  context.setState({ flow: 'shopping_wait_confirm', order: { productID: product.id } })
 
  
  context.reply([{
    type: 'template',
    altText: '我確認一下唷～',
    template: {
      type: 'buttons',
      thumbnailImageUrl: product.imgUrl,
      imageBackgroundColor: '#FFFFFF',
      title: '我確認一下唷～',
      text: `您想要參加 ${product.name}，對吧？`,
      actions: [
        {
          type: 'postback',
          label: '沒錯！',
          displayText: '沒錯！',
          data: `flow=shopping&action=confirm`
        }, {
          type: 'postback',
          label: '不對唷～',
          displayText: '不對唷～',
          data: `flow=shopping&action=cancel`
        }
      ]
    } }])
  
}



const cancelBuy = context => {
  console.log('handle_shopping_flow, cancelBuy')
  context.state.flow = null
  context.state.order = null
  context.pushText('報名已先幫您取消囉')
  context.pushText('再看看有沒有其他喜歡的活動吧～')
  console.log('handle_shopping_flow, reply order has already cancel')
  console.log('handle_shopping_flow, final state: ', context.state)
}


  

const isWaitConfirm = context => {
  
  if (context.state.flow == 'shopping_wait_confirm'){
    console.log('handle_shopping_flow, isWaitConfirm, true')
    return true
  }
  return false
}

const handleWaitConfirm = async context => {
  console.log('handle_shopping_flow, handleWaitConfirm')
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'confirm') {
    console.log(`handle_shopping_flow, user confirm order`)
    await context.replyText('報名資訊已確認')
    if (!context.state.member) {
      return handleMemberFlow(context)
    }
    console.log('handle_shopping_flow, final state: ', context.state)
    await Order.newOrder(context.state.order)
    await context.pushText('報名完成！請至社員資料/已報名活動查看')
    context.state.flow = null
  }
  if (event.isPostback && event.postback.query && event.postback.query.action === 'cancel') {
    console.log(`handle_shopping_flow, user cancel order`)
    return cancelBuy(context)
    
  }
}

module.exports = new LineHandler()
  .on(isBuy, handleBuy)
  
  .on(isWaitConfirm, handleWaitConfirm)
  .onEvent(context => console.log('handle_shopping_flow, uncaught event:', context.event.rawEvent))
  .build()
