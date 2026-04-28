// JavaScript plugin exposed to the Unity WebGL build.
// Functions declared here become callable from C# via [DllImport("__Internal")].
// See example.cs -> RedirectBOF() / RedirectBOFClicked().
mergeInto(LibraryManager.library, {

  // Advance the BOFS page flow from inside the running build by
  // navigating the host page to BOFS's /redirect_next_page route.
  RedirectBOF: function () {
    window.location.href = "/redirect_next_page";
  },

});
