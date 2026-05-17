require("dotenv").config();
const cors= require("cors");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuariosController = require("./controllers/usuariosController");
const usuariosRoutes = require("./routes/usuariosRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const pool= require("./database/db");
app.use(express.json());
app.use(usuariosRoutes);
app.use(cors());



let usuarios=[
  {nombre: "Clark", dinero: 5000}
];




app.post("/usuarios", async function(req, res){
  
  const nombre = req.body.nombre;
  const dinero = req.body.dinero
  await pool.query(
    "INSERT INTO usuarios(nombre, dinero) VALUES($1, $2)",
    [nombre, dinero]
  );

    res.json({
     mensaje: "Usuario guardado en PostgreSQL"
    
   });

  });




app.get("/usuarios/:nombre", function(req, res){

  let nombreBuscado=req.params.nombre;
  
  for(let i=0; i< usuarios.length; i++){

   if(usuarios[i].nombre == nombreBuscado){
     return res.json(usuarios[i]);
  }

 }
  
  res.json({
   mensaje:  "Usuario no encontrado "
 });

});



app.get("/agregar", function(req, res){
   usuarios.push({

    nombre:"Ana",
    dinero:9000
  });

   res.json(usuarios);

 });


app.get("/eliminar/:nombre", function(req,res){

  let nombre = req.params.nombre;
  usuarios = usuarios.filter(function(usuario){

   return usuario.nombre != nombre;
 });

  res.json({
   mensaje: "Usuario eliminado ",
   usuarios: usuarios
 });
});


app.put("/usuarios/:id", async function(req, res){
  const id = req.params.id;
  const nombre = req.body.nombre;
  const dinero = req.body.dinero;
  await pool.query(
    "UPDATE usuarios SET nombre = $1, dinero = $2 WHERE id = $3",
    [nombre, dinero, id]
  );
  res.json({
    mensaje: "Usuario actualizado "
  });
});


app.delete("/usuarios/:id", async function(req, res){
  const id = req.params.id;
  await pool.query(
    "DELETE FROM usuarios WHERE id = $1",
    [id]
  );

  res.json({
    mensaje: "Usuario eliminado "
  });

});


app.post("/registro", async function(req, res){
  console.log(req.body);
  const nombre = req.body.nombre;
  const password = req.body.password;

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO usuarios_login(nombre, password) VALUES($1, $2)",
    [nombre, passwordHash]
  );

  res.json({
    mensaje: "Usuario registrado "
  });

});


app.post("/login", async function(req, res){
  const nombre = req.body.nombre;
  const password = req.body.password;

  const resultado = await pool.query(
    "SELECT * FROM usuarios_login WHERE nombre = $1",
    [nombre]
  );
  if(resultado.rows.length==0){
    return res.json({
      mensaje: "Usuario no existe "
    });
  }

  const usuario = resultado.rows[0];

  const passwordCorrecta = await bcrypt.compare(password, usuario.password);

  if(!passwordCorrecta){
    return res.json({
      mensaje: "Contraseña incorrecta "
    }); 
  }

  const token = jwt.sign(
    
    {
      id: usuario.id,
      rol: usuario.rol
    },

    process.env.JWT_SECRET,
    {expiresIn: "1m"}
  );

  res.json({
    mensaje: "Login Correcto ",
    token: token
  });



});


app.get("/privado", authMiddleware.verificarToken, function(req, res){
  res.json({
    mensaje: "Ruta privada ",
    usuario: req.usuario
  });
});


app.get("/admin", authMiddleware.verificarToken, authMiddleware.soloAdmin, function(req, res){
  res.json({
    mensaje: "Bienvenido administrador "
  });
 }
);





const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){

  console.log("Servidor en puerto "+ PORT);
});






