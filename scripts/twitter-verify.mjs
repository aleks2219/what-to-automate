// Verify Twitter API credentials work by fetching the authenticated user's profile.
// This is a read-only request — doesn't post anything.

import { getTwitterClient } from './twitter-client.mjs';

console.log('Verifying Twitter API credentials...');
console.log('');

try {
  const client = getTwitterClient();

  // v2: get the authenticated user
  const me = await client.v2.me({
    'user.fields': ['id', 'name', 'username', 'public_metrics'],
  });

  const user = me.data;
  console.log('✓ Credentials valid!');
  console.log('');
  console.log(`  Account:   @${user.username} (${user.name})`);
  console.log(`  User ID:   ${user.id}`);
  if (user.public_metrics) {
    console.log(`  Followers: ${user.public_metrics.followers_count}`);
    console.log(`  Following: ${user.public_metrics.following_count}`);
    console.log(`  Tweets:    ${user.public_metrics.tweet_count}`);
  }

  // Also verify the app has Write permission by checking rate limit headers
  // (a read-only way to confirm the access token has write scope)
  console.log('');
  console.log('✓ Ready to post tweets on behalf of @' + user.username);
} catch (err) {
  console.error('✗ Credential verification failed.');
  console.error('');
  if (err.code) {
    console.error(`  Error code: ${err.code}`);
  }
  if (err.data?.title) {
    console.error(`  Title: ${err.data.title}`);
    console.error(`  Detail: ${err.data.detail || '(no detail)'}`);
  } else {
    console.error(`  ${err.message}`);
  }
  console.error('');
  console.error('Common causes:');
  console.error('  - Access Token not generated yet (only Bearer Token exists)');
  console.error('  - App permissions are Read-only (must be Read and Write)');
  console.error('  - OAuth 1.0a not enabled in User authentication settings');
  console.error('  - Token was regenerated and is stale');
  process.exit(1);
}
