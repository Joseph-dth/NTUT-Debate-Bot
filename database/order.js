const airtable = require('./airtable.js')
const _ = require('lodash')


const getProductId = context =>{
    return context.state.order.productID
}

const getId = context =>{
    
    return context.session.user.id
}


module.exports.newOrder = async({
        
        productID=getProductId,
        ID=getId
    } = {}) => {
        id=_.trim(ID)
        product_id=_.trim(productID)
        console.log(`record id: ${id}`)
        const newOrder =await airtable.createRecord({table:'order', data: {fields:{ id, product_id}}})
        return newOrder
    }
