Versioning
==========

This project uses [Semantic Versioning](http://semver.org/) on its external interface.
This means that a breaking change if methods of classes, what is exported, etc. *can only happen* with major version bump `(x.-.-)`.

The semantic versioning, however, does *not* apply to internal interfaces and state.
For example, how a `Message` chooses to store its state is subject to change *without* a major version bump.
In fact, it may change in either minor `(-.x.-)` or patch `(-.-.x)` version bumps.

A major version bump means that some interface has been broken by the changes added.

A new minor version bump means that new functionality has been added without breaking the existing interfaces.

A patch version bump means that something has been fixed, or some internals have changed, without adding new functionality.
