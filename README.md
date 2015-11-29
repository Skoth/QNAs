# QNAs

A user-defined question-and-answer Chrome Extension designed with mathematics and programming in mind. To these ends, particular emphasis has been placed on: 
* Rendering equations via [MathJax](https://www.mathjax.org/)
* Code I/O formatted with [CodeMirror](https://codemirror.net/)
* SPA organization through [AngularJS](https://angularjs.org/)

This project also makes use of the [textAngular](https://github.com/fraywing/textAngular) project to enable RTE customizable questions-and-answers.

*This is still very much a work-in-progress*, so much of the core logic still needs to be implemented, and a good deal of the code is neither optimized nor organized for best performance and readability, respectively.

To build and run this project on your own system, you will need to install some bower dependencies (bower.json soon to be added to override this requirement):

`bower install angular angular-route bootstrap MathJax textAngular angular-ui-codemirror`