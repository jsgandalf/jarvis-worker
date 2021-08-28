import jwt from 'jsonwebtoken';

export default (req, res) =>{
    try {
        const reqEmail = req.body.email;
        const reqPassword = req.body.password;
        if (!reqEmail) throw new Error('provide a email');
        if (!reqEmail) throw new Error('provide a password');
        if (reqPassword !== process.env.ROOT_PASSWORD) return res.send(401);

        const token = jwt.sign({
            data: reqEmail
          }, process.env.SECRET, { expiresIn: '500h' });

        //@ts-ignore
        return res.status(200).json(token);
    } catch (e) {
        if (e === 'unauthorized') return res.status(403);
        console.log(e);
        return res.status(400).send(e.message);
    }
}