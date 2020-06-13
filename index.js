const core = require('@actions/core');
const github = require('@actions/github');

const MODE_DELETE_PREVIOUS = "delete-previous";
const MODE_UPDATE_PREVIOUS = "update-previous";
const MODE_KEEP_PREVIOUS = "keep-previous";

async function run() {
  try {
    const id = core.getInput('id', {required: true});
    const body = core.getInput('body', {required: true});
    const token = core.getInput('github-token', {required: true});
    const mode = core.getInput('mode', {required: true});
    const issueNumber = core.getInput('issue') || getIssueNumber();

    const octokit = github.getOctokit(token);
    const context = github.context;

    const marker = '<!-- comment-id:' + id + ' -->';


    if (!issueNumber) {
      console.log('Could not get pull request number from context, exiting');
      return;
    }

    if (mode === MODE_DELETE_PREVIOUS) {
      await deleteExistingComments(marker, octokit, issueNumber, context);
      await addCommentWithMarker(body, marker, octokit, issueNumber, context);
    } else if (mode === MODE_KEEP_PREVIOUS) {
      await addCommentWithMarker(body, marker, octokit, issueNumber, context);
    } else if (mode === MODE_UPDATE_PREVIOUS) {
      await replacePreviousComment(body, marker, octokit, issueNumber, context);
    } else {
      core.setFailed('Invalid mode "' + mode + '" specified. Aborting.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function replacePreviousComment(body, marker, octokit, issueNumber, context) {
  const comments = await getComments(issueNumber, context, octokit);

  for (const comment of comments) {
    if (comment.body.includes(marker)) {
      console.log('Found existing comment, will update it. comment id: ' + comment.id);
      octokit.issues.updateComment({
        ...context.repo,
        comment_id: comment.id,
        body: markedBody(body, marker),
      });
      return;
    }
  }
  console.log('No existing comment found - creating a new one.');
  await addCommentWithMarker(body, marker, octokit, issueNumber, context);
}

function markedBody(body, marker) {
  return body + '\n\n' + marker;
}


async function addCommentWithMarker(body, marker, octokit, issueNumber, context) {
  octokit.issues.createComment({
    ...context.repo,
    issue_number: issueNumber,
    body: markedBody(body, marker),
  });
}

async function deleteExistingComments(marker, octokit, issueNumber, context) {
  const comments = await getComments(issueNumber, context, octokit);

  for (const comment of comments) {
    if (comment.body.includes(marker)) {
      console.log('Deleting existing comment with id: ' + comment.id)
      octokit.issues.deleteComment({
        ...context.repo,
        comment_id: comment.id,
      });
    }
  }
}

async function getComments(issueNumber, context, octokit) {
  const opts = octokit.issues.listComments.endpoint.merge({
    ...context.repo,
    issue_number: issueNumber
  });
  return await octokit.paginate(opts);
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
