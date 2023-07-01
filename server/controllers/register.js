

const handleRegister = (req, res, db, bcrypt) => {
    const {email, password, name} = req.body;
    const hash = bcrypt.hashSync(password); // sync bcrypt

    // Check if email, name or password fields are empty
    if (!email || !password || !name){
        return res.status(400).json("Incorrect Form Submission")
    }

    db.transaction(trx => 
        {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('app_login')
            .returning('email')

            .then(loginEmail =>{
            return trx('app_users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                })
                .then(user =>
                    {
                        res.json(user[0])
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
   .catch(err => res.status(400).json('Registration failed!    ' + err))
}

module.exports = {
    handleRegister: handleRegister
} 