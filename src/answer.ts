let date = (): string => {
    const dateObj: Date = new Date();
    return dateObj.toJSON().slice(0, 10);
}

export async function getAnswer(): Promise<string> {
    let endpoint: string = `https://www.nytimes.com/svc/wordle/v2/${date()}.json`;
    return fetch(endpoint).then(response => {
        return response.json().then(body => {
            return body['solution'];
        }).catch(e => console.error(e))
    }).catch(e => console.error(e));
}
