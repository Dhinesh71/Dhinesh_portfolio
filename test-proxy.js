const query = `
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
            acSubmissionNum {
            difficulty
            count
            }
        }
        }
    }
`;

const username = "Jivan-Patel";

async function testProxy() {
    try {
        const res = await fetch('https://corsproxy.io/?https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables: { username } })
        });
        const text = await res.text();
        console.log("PROXY:", text);
    } catch (e) {
        console.error(e);
    }
}

testProxy();
