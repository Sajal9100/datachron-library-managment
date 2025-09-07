class ErrorApi extends Error {
 constructor(message ,statusCode ,success){
    super(message);
    this.statusCode = statusCode,
    this.success = success; 
 
    // if(Error.captureStackTrace){
    //     Error.captureStackTrace(this,ErrorApi);
    // }
}

}
module.exports = {ErrorApi};