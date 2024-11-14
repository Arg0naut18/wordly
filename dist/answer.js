let date = () => {
    const dateObj = new Date();
    return dateObj.toJSON().slice(0, 10);
};
export async function getAnswer() {
    let endpoint = `https://www.nytimes.com/svc/wordle/v2/${date()}.json`;
    return fetch(endpoint).then(response => {
        return response.json().then(body => {
            return body['solution'];
        }).catch(e => console.error(e));
    }).catch(e => console.error(e));
}
