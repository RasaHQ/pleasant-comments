const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const id = core.getInput('id', {required: true});
    const body = core.getInput('body', {required: true});
    const token = core.getInput('github-token', {required: true});
    const issueNumber = core.getInput('issue') || getIssueNumber();

    const octokit = github.getOctokit(token);
    const context = github.context;

    const marker = '<!-- pleasant-commenter-id:' + id + ' -->';


    if (!issueNumber) {
      console.log('Could not get pull request number from context, exiting');
      return;
    }

    await deleteExistingComments(marker, octokit, issueNumber, context)
    await addCommentWithMarker(body, marker, octokit, issueNumber, context)

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function addCommentWithMarker(body, marker, octokit, issueNumber, context) {
    const markedBody = body + '\n\n' + marker;
    octokit.issues.createComment({
      ...context.repo,
      issue_number: issueNumber,
      body: markedBody,
    });
}

async function deleteExistingComments(marker, octokit, issueNumber, context) {
  const opts = octokit.issues.listComments.endpoint.merge({
    ...context.repo,
    issue_number: issueNumber
  });
  const comments = await octokit.paginate(opts);

  for (const comment of comments) {
    if (comment.body.includes(marker)) {
      console.log('About to delete comment: ' + comment.id)
      octokit.issues.deleteComment({
        ...context.repo,
        comment_id: comment.id,
      });
    }
  }
}

function getIssueNumber() {
  if (github.context.payload.pull_request) {
    return github.context.payload.pull_request.number;
  } else if (github.context.payload.issue) {
    return github.context.payload.issue.number;
  } else {
    return undefined;
  }
}

run();
