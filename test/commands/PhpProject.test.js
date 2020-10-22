const {expect, test} = require('@oclif/test')

describe('PhpProject', () => {
  test
  .stdout()
  .command(['PhpProject'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['PhpProject', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
