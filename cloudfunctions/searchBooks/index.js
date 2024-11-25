const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { keyword } = event;
  
  try {
    const result = await db.collection('books')
      .where({
        name: db.RegExp({
          regexp: keyword,
          options: 'i',
        })
      })
      .limit(10)
      .get();

    return {
      code: 0,
      data: result.data
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message
    };
  }
}; 