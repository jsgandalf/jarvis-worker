export default (req, res) =>{
    return res.status(200).send({profit: Math.floor((Math.random() * 1000) + 1)});
}