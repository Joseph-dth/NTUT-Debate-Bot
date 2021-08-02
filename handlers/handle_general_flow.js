const { LineHandler } = require('bottender')

const Product = require('../database/product.js')
const _ = require('lodash')
const handleMemberFlow = require('./handle_member_flow.js')


const requiredParam = param => {
  const requiredParamError = new Error(`Required parameter, "${param}" is missing.`)
  // preserve original stack trace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(requiredParamError, requiredParam)
  }
  throw requiredParamError
}

const toColumn = product => {
  return {
    thumbnailImageUrl: product.imgUrl,
    imageBackgroundColor: '#FFFFFF',
    title: product.name,
    text: product.detail + product.url,
    defaultAction: {
      type: 'postback',
      label: '我想參加 !',
      displayText: '我想參加 !',
      data: `flow=shopping&action=buy&productID=${product.id}`
    },
    actions: [
      {
        type: 'postback',
        label: '我想參加 !',
        displayText: '我想參加 !',
        data: `flow=shopping&action=buy&productID=${product.id}`
      }
    ]
  }
}

const toColumns = ({
  products = requiredParam('products'),
  offset
} = {}) => {
  let columns = _.map(products, toColumn)
  if (columns.length === 9 && offset) {
    columns.push({
      thumbnailImageUrl: 'https://i.imgur.com/0O9cN53.jpg',
      imageBackgroundColor: '#ddc39d',
      title: '想看更多嗎？',
      text: '還有更多好甜好吃的糖果唷(招手',
      defaultAction: {
        type: 'postback',
        label: '我想看更多！',
        displayText: '我想看更多！',
        data: `flow=general&action=getProducts&offset=${offset}`
      },
      actions: [
        {
          type: 'postback',
          label: '我想看更多！',
          displayText: '我想看更多！',
          data: `flow=general&action=getProducts&offset=${offset}`
        }
      ]
    })
  }
  return columns
}

const handleGetProducts = async context => {
  console.log('handle_general_flow, handleGetProducts')
  const { offset } = context.event.postback.query
  const result = await Product.readProducts({ offset })
  let carouselProducts = {
    type: 'template',
    altText: '近期活動',
    imageAspectRatio: 'rectangle',
    imageSize: 'cover',
    template: {
      type: 'carousel',
      columns: toColumns({ products: result.products, offset: result.offset })
    } }
  context.reply([carouselProducts])
  console.log(`handle_general_flow, reply products list`)
  console.log(`handle_general_flow, final state: `, context.state)
}

const isGetProducts = context => {
  const { event } = context
  if (event.postback.query.action && event.postback.query.action === 'getProducts') {
    console.log(`handle_general_flow, isGetProducts, true`)
    return true
  }
  return false
}

let memberinfo = { 
  
  type: 'text',
  text: '社員資料',
  quickReply: {
    items:[
      {
        type:'action',
        action:{
          type:'postback',
          label:'個人資料',
          data:'flow=general&action=getInfo',
        }
      },
      {
        type:'action',
        action:{
          type:'postback',
          label:'已報名的活動',
          data:'flow=general&action=getorder',
        }
      }
    ]
  }
}



const isGetMemberInfo = context => {
  const { event } = context
  if (event.postback.query.action && event.postback.query.action === 'get') {
    console.log(`handle_general_flow, isGetMemberInfo, true`)
    return true
  }
  return false
}



const handleGetMemberInfo = context => {
  
  console.log(`handle_general_flow, reply You click getinfo`)
  console.log(`handle_general_flow, final state: `, context.state)
  context.reply([memberinfo])

}

const isGetInfo = context => {
  const { event } = context
  if (event.postback.query.action && event.postback.query.action === 'getInfo'){
    return true
  }
  return false
}

const handleGetInfo = context=>{
  if (!context.state.member){
    return handleMemberFlow(context)
  }
  else{
    context.reply([
      {type: 'template',
      altText: '～',
      template: {
        type: 'buttons',
        thumbnailImageUrl: 'https://i.imgur.com/dvYQD8J.jpg',
        mageBackgroundColor: '#FFFFFF',
        title: '聯絡資訊如下',
        text: `姓名：${context.state.member.name}
手機：${context.state.member.phone}`,
        actions: [
          {
          type: 'postback',
          label: '更改聯絡資訊！',
          displayText: '更改聯絡資訊！',
          data: `flow=updateMember&action=updateMember`
          }, 
          ]
        }
      }
    ])
  }
}

const isGetOrder = context=> {
  const { event } = context
  if(event.postback.query.action && event.postback.query.action === 'getorder'){
    return true
  }
  return false
}

const handleGetOrder = async context =>{
  
  const product = await Product.readProduct({ id: context.state.order.productID })
  context.reply([
    {
      type: 'template',
      altText: '已報名的活動',
      template: {
        type: 'buttons',
        thumbnailImageUrl: product.imgUrl,
        imageBackgroundColor: '#FFFFFF',
        title: '已報名的活動',
        text: `您已報名 ${product.name}
${product.detail}`,
        
        actions: [
          {
            type: 'postback',
            label: '取消報名',
            displayText: '取消報名！',
            data: `flow=redo&action=cancelOrder`
          }, 
        ]
      } }
  ])
}




module.exports = new LineHandler()
  
  .on(isGetMemberInfo, handleGetMemberInfo)
  .on(isGetInfo, handleGetInfo)
  .on(isGetOrder, handleGetOrder)
  .on(isGetProducts, handleGetProducts)
  .onEvent(context => console.log('handle_general_flow, uncaught event:', context.event.rawEvent))
  .build()
