exports.successMessage=(message, data)=>({
  success : true,
  message,
  data
});

exports.errorMessage = ( message) => ({
  success: false,
  message
});