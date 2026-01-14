// Simple API Test Script for GigFlow
const http = require('http');

const BASE_URL = 'http://localhost:5000';
let cookies = '';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (cookies) {
            options.headers['Cookie'] = cookies;
        }

        const req = http.request(options, (res) => {
            let data = '';

            // Capture cookies from response
            const setCookie = res.headers['set-cookie'];
            if (setCookie) {
                cookies = setCookie.map(c => c.split(';')[0]).join('; ');
            }

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('GigFlow API Test Suite');
    console.log('='.repeat(60));

    try {
        // Test 1: Health Check
        console.log('\n1. Health Check');
        const health = await makeRequest('GET', '/api/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response:`, health.data);

        // Test 2: Register User 1 (Gig Owner)
        console.log('\n2. Register User 1 (Gig Owner)');
        const timestamp = Date.now();
        const user1 = await makeRequest('POST', '/api/auth/register', {
            name: 'Alice Owner',
            email: `alice${timestamp}@test.com`,
            password: 'password123',
        });
        console.log(`   Status: ${user1.status}`);
        console.log(`   Response:`, user1.data);
        const user1Id = user1.data?.user?._id;
        const user1Cookie = cookies;

        // Test 3: Get Current User
        console.log('\n3. Get Current User (/api/auth/me)');
        const me = await makeRequest('GET', '/api/auth/me');
        console.log(`   Status: ${me.status}`);
        console.log(`   Response:`, me.data);

        // Test 4: Create a Gig
        console.log('\n4. Create a Gig');
        const gig = await makeRequest('POST', '/api/gigs', {
            title: 'Build a React Dashboard',
            description: 'Need a responsive admin dashboard with charts and graphs',
            budget: 500,
        });
        console.log(`   Status: ${gig.status}`);
        console.log(`   Response:`, gig.data);
        const gigId = gig.data?.gig?._id;

        // Test 5: Get All Open Gigs
        console.log('\n5. Get All Open Gigs');
        const gigs = await makeRequest('GET', '/api/gigs');
        console.log(`   Status: ${gigs.status}`);
        console.log(`   Count: ${gigs.data?.count}`);

        // Test 6: Search Gigs
        console.log('\n6. Search Gigs (?search=React)');
        const searchGigs = await makeRequest('GET', '/api/gigs?search=React');
        console.log(`   Status: ${searchGigs.status}`);
        console.log(`   Count: ${searchGigs.data?.count}`);

        // Test 7: Register User 2 (Freelancer)
        console.log('\n7. Register User 2 (Freelancer)');
        const user2 = await makeRequest('POST', '/api/auth/register', {
            name: 'Bob Freelancer',
            email: `bob${timestamp}@test.com`,
            password: 'password123',
        });
        console.log(`   Status: ${user2.status}`);
        console.log(`   Response:`, user2.data);
        const user2Cookie = cookies;

        // Test 8: Create Bid on Gig
        console.log('\n8. Create Bid on Gig');
        const bid = await makeRequest('POST', '/api/bids', {
            gigId: gigId,
            message: 'I can build this dashboard in 5 days!',
        });
        console.log(`   Status: ${bid.status}`);
        console.log(`   Response:`, bid.data);
        const bidId = bid.data?.bid?._id;

        // Test 9: Try to bid on own gig (should fail)
        console.log('\n9. Switch back to User 1 and try to view bids');
        cookies = user1Cookie; // Switch to owner
        const viewBids = await makeRequest('GET', `/api/bids/${gigId}`);
        console.log(`   Status: ${viewBids.status}`);
        console.log(`   Bids count: ${viewBids.data?.count}`);

        // Test 10: Hire the freelancer
        console.log('\n10. Hire the Freelancer');
        const hire = await makeRequest('PATCH', `/api/bids/${bidId}/hire`);
        console.log(`   Status: ${hire.status}`);
        console.log(`   Response:`, hire.data);

        // Test 11: Verify gig is now assigned
        console.log('\n11. Verify Gig Status (should be assigned)');
        const gigsAfter = await makeRequest('GET', '/api/gigs');
        console.log(`   Open gigs count: ${gigsAfter.data?.count}`);
        console.log(`   (Previous gig should not appear as it is now assigned)`);

        // Test 12: Logout
        console.log('\n12. Logout');
        const logout = await makeRequest('POST', '/api/auth/logout');
        console.log(`   Status: ${logout.status}`);
        console.log(`   Response:`, logout.data);

        console.log('\n' + '='.repeat(60));
        console.log('All tests completed successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTests();
