const {expect, test} = require('@oclif/test')

describe('glabrunner', () => {
  test
  .stdout()
  .command(['glabrunner'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['glabrunner', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
