const jwt = require("jsonwebtoken");

function verificarToken(req, res, next){
    const token = req.headers.authorization;
    if(!token){
      return res.json({
        mensaje: "Token requerido "
      });
    }
  
    try{
      const datos = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario=datos;
      next();
    }catch(error){
      return res.json({
        mensaje: error.message
  
      });
    }
  
  }
  
  
  function soloAdmin(req, res, next){
  
    if(req.usuario.rol != "admin"){
      return res.json({
        mensaje: "Acceso denegado"
      });
    }
    next();
  }

  module.exports = {verificarToken, soloAdmin};