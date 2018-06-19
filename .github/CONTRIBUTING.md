# Contributing to react-easy-crop

**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Setting Up the project locally

To install the project you need to have `yarn` and `node`

1. [Fork](https://help.github.com/articles/fork-a-repo/) the project, clone your fork:

   ```
   # Clone your fork
   git clone https://github.com/<your-username>/react-easy-crop.git

   # Navigate to the newly cloned directory
   cd react-easy-crop
   ```
2. `yarn` to install dependencies
3. `yarn start` to start the example app

> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream git@github.com:ricardo-ch/react-easy-crop.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream,"
> Then fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`.
> Then you can make all of your pull request branches based on this `master`
> branch. Whenever you want to update your version of `master`, do a regular
> `git pull`.

## Submitting a Pull Request

Please go through existing issues and pull requests to check if somebody else is already working on it.
