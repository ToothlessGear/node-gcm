Contributing
============

We appreciate any help we can get!
If you spot something that is wrong, please create an [issue](https://github.com/ToothlessGear/node-gcm/issues/new).
If you want to fix something, feel free to submit a [Pull Request](https://github.com/ToothlessGear/node-gcm/compare).

**But before you do so** please read these guidelines for contributing.

### Contents

- [Creating an issue](#creating-an-issue)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Become a Collaborator!](#become-a-collaborator)

Creating an issue
-----------------

Nothing is too small for an issue.
Issues are a great way to start a discussion of which direction the project should move in, what it should and should not cover, etc.

When submitting an issue, remember to be thorough and precise with the question you are asking.

**A good issue would be...**

- **A bug report**, including details of the conditions under which the bug is experienced.  
  Please be specific with the exact environment you are using.
  If the client-side might be relevant, remember to include details about what kind of app you are writing.
- **A feature request**.  
  If we are missing some feature from the [GCM reference](https://developers.google.com/cloud-messaging/server-ref), please let us know.
  Remember to include a link to the relevant section in the reference.  
  A feature request may also be a request for a new kind of abstraction that would make it easier to work with notifications.
- **An open question**.  
  If you are wondering about a particular use case for the library, or if there is something you find unclear, there are probably plenty more people like you.
  Let us know, and together we can find a way to make better documentation, so fewer people will be in your position in the future.

You get the gist: pretty much anything goes, but remember an adequate amount of details.

Submitting a Pull Request
-------------------------

A pull request is the most tangible way to contribute.
You change some code, submit a request, and poof, you're a contributor (granted that your code is useful).

When submitting a pull request there are a couple of things to watch out for:

- Your commits will be read by others.
  It will be easier to understand them if you keep them clear and concise.
  Do **one thing in each commit**.
- Your code will be read by others.
  Strive to make it as clear as possible, while still following the code conventions seen elsewhere in the code.
- If you have several ideas for changes, create several pull requests.
  It is in no way a given that we will find all of your proposals for change perfect in the first go, so if you want your changes in quickly separate them into several pull requests.
  For example, one pull request could refactor the way we send messages, and the next could add a new type of message.
  Doing both in one PR will likely make discussion of the code longer.
- You should write tests for your changes.
- Anything you contribute will be subject to the [license](LICENSE.md).

**A good pull request would be...**

- **A bug fix**, fixing a bug you found, or fixing a bug someone else reported in an issue.
- **A new feature** from the [GCM reference](https://developers.google.com/cloud-messaging/server-ref) that had not yet been included in the library, or a new feature that you would like to introduce.
  Bear in mind that new features may be subject to a lot of discussion, depending on how good your initial arguments are.
  It is important in an open source library like this to move in the *right* direction, not just any direction.
  Otherwise, the library would quickly become messy and hard to use.
- **Some refactoring** of code that you think could be improved.
  Refactoring takes many forms.
  You could change the name of a variable for clarity, juggle around some code to get something that is more easily understandable, or anything else you think will improve the code base.
- **Improving documentation**, either by introducing a new section or fixing some typos.
  No fix is too small!

When you're creating a pull request don't forget to add yourself to the list of collaborators in [package.json](package.json).

Become a Collaborator!
----------------------

A collaborator can merge pull requests, close issues and push to the master branch.
Collaborators are the ones that make sure the project keeps going and doesn't grind to a halt.

We are always interested in getting more collaborators!

The best way to move towards becoming one is submitting some pull requests and maybe dropping an existing collaborator a note.
