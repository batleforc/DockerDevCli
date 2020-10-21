const {expect, test} = require('@oclif/test')

describe('createandstart', () => {
  test
  .stdout()
  .command(['createandstart'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['createandstart', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
