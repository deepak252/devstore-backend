exports.success=(message, data)=>({
  success : true,
  message,
  data
});

exports.failure = ( message) => ({
  success: false,
  message
});