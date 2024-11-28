const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateJWT } = require('../helpers/jwt');

const createUser = async (req, res) => {
    const { name, email, password, career } = req.body;


    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({
            ok: false,
            msg: 'Un usuario existe con ese correo'
        })
    }

    user = new User(req.body);

    //Encirptar la contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    //Generar el JWT
    const token = await generateJWT(user.id, user.name);

    res.status(201).json({
        ok: true,
        uid: user.id,
        name: user.name,
        token
    })
}

const loginUser = async (req, res = response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                ok: false,
                msh: 'No existe un usuario con ese email'
            })
        }

        //Confirmando las passwords
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            })
        }

        //Generar JWT
        const token = await generateJWT(user.id, user.name);

        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error: por favor, contacte con el administrador'
        })
    }

}

const renewToken = async (req, res) => {

    const uid = req.uid;
    const name = req.name;

    //generar un nuevo JWT y retornarlo en esta petición
    const token = await generateJWT(uid, name);

    res.json({
        ok: true,
        uid, name,
        token
    })

}

module.exports = {
    createUser,
    loginUser,
    renewToken
}