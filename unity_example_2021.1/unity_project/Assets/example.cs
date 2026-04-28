using System;
using System.Collections;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;

/// <summary>
/// Demonstrates the BOFS <-> Unity WebGL integration points used by the
/// example project: receiving the participant ID from the host page,
/// querying the participant's condition over HTTP, posting data back to a
/// custom BOFS table, and advancing the BOFS page flow from within Unity.
///
/// The InputField references are populated in the Unity scene; in a real
/// study these would typically be replaced with internal state rather than
/// visible UI fields.
/// </summary>
public class example : MonoBehaviour
{
    public InputField condition;
    public InputField participantID;
    public InputField userInput;

    void Start()
    {
        // Pull the participant's assigned condition as soon as the build is up.
        StartCoroutine(LoadCondition());
    }

    /// <summary>
    /// Receives the participant ID pushed in by the host page once the build
    /// has finished loading. Called from the BOFS template via
    /// ``gameInstance.SendMessage('Canvas', 'SetParticipantID', ...)``.
    /// </summary>
    public void SetParticipantID(int participantID)
    {
        this.participantID.text = participantID.ToString();
    }

    /// <summary>
    /// Asks BOFS for the current participant's condition. The Flask route
    /// ``/fetch_condition`` returns the condition number as plain text and
    /// requires an active BOFS session, so this only works when the build is
    /// served from inside a running BOFS project.
    /// </summary>
    IEnumerator LoadCondition()
    {
        string url = "/fetch_condition";

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();

            if (request.isNetworkError || request.isHttpError)
            {
                Debug.Log(request.error);
            }
            else
            {
                string response = request.downloadHandler.text;

                if (response.Length == 0)
                {
                    Debug.Log("Unable to load condition! Does the participant have a valid session?");
                }
                else
                {
                    Debug.Log(response);
                    condition.text = response;
                }
            }
        }
    }

    /// <summary>
    /// Posts the contents of <c>userInput</c> back to the current BOFS page.
    /// The matching Flask route writes the value to the ``game_log`` table
    /// (see ``handle_game_post`` in ``views.py``).
    /// </summary>
    public void PostInput()
    {
        WWWForm frm = new WWWForm();
        frm.AddField("input", userInput.text);

        try
        {
            // The "#" target posts to the current page URL, so the same
            // build can be reused on /game_embed, /game_fullscreen, etc.
            var request = UnityWebRequest.Post("#", frm);
            request.SendWebRequest();
        }
        catch (Exception ex)
        {
            Debug.Log("Error in PostInput(): " + ex.Message);
        }
    }

    // RedirectBOF is implemented in the JavaScript plugin Plugins/BOF.jslib
    // and navigates the host page to /redirect_next_page, which advances the
    // BOFS page flow.
    [DllImport("__Internal")]
    public static extern void RedirectBOF();

    /// <summary>
    /// Wrapper for hooking RedirectBOF up to a UI Button OnClick, since the
    /// inspector cannot bind directly to a static extern.
    /// </summary>
    public void RedirectBOFClicked()
    {
        RedirectBOF();
    }

    /// <summary>
    /// Older fallback redirect used before the .jslib plugin was introduced.
    /// Kept here for reference; prefer <see cref="RedirectBOF"/> in new
    /// projects since <c>Application.ExternalEval</c> is deprecated.
    /// </summary>
    public void RedirectBOFDeprecated()
    {
        Application.ExternalEval("window.location.href = \"/redirect_next_page\";");

        // Stop the simulation so the build doesn't keep running while the
        // browser navigates away.
        Time.timeScale = 0f;
    }

    void Update()
    {
    }
}
