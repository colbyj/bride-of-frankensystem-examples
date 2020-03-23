using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;

public class example : MonoBehaviour
{
    public InputField condition;
    public InputField participantID;
    public InputField userInput;

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(LoadCondition());
    }

    public void SetParticipantID(int participantID) 
    {
        this.participantID.text = participantID.ToString();
    }

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

    public void PostInput() {
        WWWForm frm = new WWWForm();
        frm.AddField("input", userInput.text);

        try {
            var request = UnityWebRequest.Post("#", frm);
            request.SendWebRequest();
        }
        catch (Exception ex) {
            Debug.Log("Error in PostInput(): " + ex.Message);
        }
    }
    
    [DllImport("__Internal")]
    public static extern void RedirectBOF();

    // Can't add RedirectBOF() to onClick directly.
    public void RedirectBOFClicked() {
        RedirectBOF();
    }

    public void RedirectBOFDeprecated() {
        // Deprecated way of redirecting participants to the next page in the experiment
        Application.ExternalEval("window.location.href = \"/redirect_next_page\";"); 

        // Make the game simulation stop.
        Time.timeScale = 0f;
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
