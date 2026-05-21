const { Octokit } = require('@octokit/rest');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the form data
    const { name, email, comment, entry, allComments } = JSON.parse(event.body);

    if (!name || !comment) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and comment are required' }),
      };
    }

    // GitHub configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;
    const BRANCH_BASE = process.env.BRANCH_BASE;
    const COMMENTS_FILE_PATH = process.env.COMMENTS_FILE_PATH;

    // Initialize Octokit
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Step 1: Get the current comments.json
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: BRANCH_BASE,
    });

    // Step 2: Add the new comment
    const newComment = {
      id: Date.now().toString(),
      entry: entry,
      name,
      comment,
      date: new Date().toISOString(),
    };

    allComments.push(newComment);

    // Step 3: Create a new branch
    const branchName = `add-comment-${newComment.id}`;
    const { data: baseRef } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${BRANCH_BASE}`,
    });

    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    // Step 4: Update the file
    const updatedContent = Buffer.from(JSON.stringify(allComments, null, 2)).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: COMMENTS_FILE_PATH,
      message: `Add comment from ${name}`,
      content: updatedContent,
      branch: branchName,
      sha: fileData.sha,
    });

    // Step 5: Create the PR
    const pr = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `New comment from ${name}`,
      head: branchName,
      base: BRANCH_BASE,
      body: `Comment details:\n- Name: ${name}\n- Email: ${email}\n- Comment: ${comment}\n- Entry: ${entrySlug}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, prUrl: pr.data.html_url }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit comment' }),
    };
  }
};