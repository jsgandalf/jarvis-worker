const getProfit = () => {

}

const reportDailyProfit = async (req, res) => {
    try {
        await getProfit();
        return res.status(200).send('Done');
    } catch(e) {
        console.error(e);
        return res.status(500);
    }
}

export default reportDailyProfit;