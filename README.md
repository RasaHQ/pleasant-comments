# Issue/PR Commenter action

This action comments on an issue or PR. Action allows to specify what happens to 
previously made comments. E.g. it can just append a new comment, replace an 
existing one or delete old ones. Deleting or replacing old comments avoids scenarios
where automated systems post a lot of comments on PRs. Cleaning old comments
makes sure the PRs comment section stays clean.

## Inputs

### `id`

**Required** Identifier used to find previously made comments.

### `body`

**Required** Text of the comment that will be posted on the issue / PR. 

### `github-token`

**Required** Access token used to access the github API. If you want to use this 
action for community PRs, you need to specify a personal access token (otherwise
the action won't be able to delete old comments).

### `mode`

**Optional** Specifies what happens to previously made comments. Either one of:
- `delete-previous`: previous comments will be deleted and a new one added
- `update-previous`: previous comment will be edited, if it does not exist a new one
  will be added 
- `keep-previous`: previous comments will be kept and a new comment will be added 

Defaults to `delete-previous`.

### `issue`

**Optional** Number of the issue / PR to post the comment on. Defaults to the issue / 
PR the action is running on.

## Example usage

```yml
uses: RasaHQ/create-comment@v1
with:
  id: 'example-1'
  body: 'Hello world!'
  mode: 'delete-previous'
  github-token: ${{ secrets.GITHUB_TOKEN }}
```
