// imports the necessary libraries for unit testing
const request = require('supertest');
const app = require('./app');


// unit testing of the app.js get function
describe("GET /reddit-viewer/:subreddit", () => {
    it("valid path with an existing subreddit and limit should work", async () => {
        const subReddit = "news";
        const limit= 5;
        const res = await request(app).get(`/reddit-viewer/${subReddit}`).query({ limit: limit });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.text).length).toBe(limit);
    });

    it("invalid subreddit should return 404 with error message", async () => {
        const nonExistingSubReddit = "ADSFASDFASDFASDFSDF";
        const res = await request(app).get(`/reddit-viewer/${nonExistingSubReddit}`);
        expect(res.statusCode).toBe(404);
        const res_text = JSON.parse(res.text).error;
        expect(res_text.startsWith("There is no subreddit with that name")).toBe(true);
    });

    it("valid subreddit without sending limit query should result in a limit less than or equal to DEFAULT_LIMIT", async () => {
        const DEFAULT_LIMIT = 100;
        const subReddit = "wallstreetbets";
        const res = await request(app).get(`/reddit-viewer/${subReddit}`);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.text).length).toBeLessThanOrEqual(DEFAULT_LIMIT);
    });

    it("valid subreddit with a negative limit query should result in a limit less than or equal to DEFAULT_LIMIT", async() => {
        const DEFAULT_LIMIT = 100;
        const subReddit = "dataisbeautiful";
        const limit = -10;
        const res = await request(app).get(`/reddit-viewer/${subReddit}`).query({limit: limit });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.text).length).toBeLessThanOrEqual(DEFAULT_LIMIT);
    });

    it("the test's data was received and is in the correct format", async () => {
        const limit = 5;
        const subReddit = "broadway";
        const res = await request(app).get(`/reddit-viewer/${subReddit}`).query({ limit: limit });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.text).length).toBe(limit);

        JSON.parse(res.text).forEach((child) => {
            expect(child).toHaveProperty('title');
            expect(child).toHaveProperty('url');
            expect(child).toHaveProperty('author');
            expect(child).toHaveProperty('score');
        });
    });
});