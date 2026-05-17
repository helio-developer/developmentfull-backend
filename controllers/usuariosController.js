const pool= require("../database/db");

async function obtenerUsuarios(req, res){
    const resultado = await pool.query(
        "SELECT id, nombre, dinero, rol FROM usuarios"
    );

    res.json(resultado.rows);
}

module.exports = {
    obtenerUsuarios
};
