# Pleasant Commenter action

This action comments on an issue or PR. Before commenting, it will delete
all previous comments that share the same `id`. Using this action avoids scenarios
where automated systems post a lot of comments on PRs. Cleaning old comments
makes sure the PRs comment section stays clean.

## Inputs

### `id`

**Required** Identifier used to find this comment again. When this action is rerun
it will delete all previous comments with the same `id`. 

### `body`

**Required** Comment that will be posted on the issue / PR. 

### `github-token`

**Required** Access token used to add / delete comments. If you want to use this 
action for community PRs, you need to specify a personal access token, otherwise
the action won't be able to delete old comments.  

### `issue`

**Optional** Number of the issue / PR to post the comment on. Defaults to the issue / 
PR the action is running on.

## Example usage

```yml
uses: RasaHQ/pleasant-comments@v1
with:
  id: 'example-1'
  body: 'Hello world!'
  github-token: ${{ secrets.GITHUB_TOKEN }}
```
