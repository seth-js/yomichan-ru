# yomichan-ru

 <h3>A modified version of Yomichan that works with Russian.</h3>
 
 <h3>Examples:</h3>
  
 ![2](https://user-images.githubusercontent.com/83692925/174556715-d5d0a6bb-8282-4158-b7c3-ece972b88b74.png)
 ![1](https://user-images.githubusercontent.com/83692925/174556837-a0f8c349-85d7-4846-a5c2-416944efb954.png)
 ![4](https://user-images.githubusercontent.com/83692925/174556952-ce323426-151c-41fb-8346-b59b7235ae37.png)

<h3>Instructions (firefox)</h3>
<ol>
 <li>Download the repository, clone it, whatever.</li>
 <li>Download the JSON and two zips from the release section.</li>
 <li>Go to: about:debugging#/runtime/this-firefox</li>
 <li>Click <code>Load Temporary Add-on…</code></li>
 <li>Navigate to the <code>manifest.json</code> in the repository and choose it.
  <br>Yomichan should now be installed.
 </li>
 <li>Head to the bottom of the Yomichan settings page.</li>
 <li>Select <code>Import Settings</code>.</li>
 <li>Choose <code>yomichan-settings-2022-06-20.json</code></li>
 <li>Go to the <code>Dictionaries</code> section and import <code>Russian Dictionary.zip</code></li>
</ol>

<h3>Instructions (chrome-based)</h3>
<ol>
 <li>Download the repository, clone it, whatever.</li>
 <li>Download the JSON and two zips from the release section.</li>
 <li>Go to: chrome://extensions/</li>
 <li>Turn on <code>Developer mode</code></li>
 <li>Click <code>Load unpacked</code></li>
 <li>Navigate to the folder where <code>manifest.json</code> is in the repository, and select the folder.
  <br>Yomichan should now be installed.
 </li>
 <li>Head to the bottom of the Yomichan settings page.</li>
 <li>Select <code>Import Settings</code>.</li>
 <li>Choose <code>yomichan-settings-2022-06-20.json</code></li>
 <li>Go to the <code>Dictionaries</code> section and import <code>Russian Dictionary.zip</code></li>
</ol>

Everything should now be set up for Yomichan.
To get the Forvo server working, unzip the `Russian Forvo` folder from `Russian Forvo.zip`, and throw it in your Anki addon folder.
Mine's in `C:\Users\[Username]\AppData\Roaming\Anki2\addons21`.

<h3>Notes</h3>
If you are already using Yomichan for Japanese, consider using this extension in a separate browser profile. This is a modified version of Yomichan and the unmodified version will have unintended results.
<br><br>
The dictionary gets data from the Kaikki Russian Wiktionary rip, and it contains almost ~74,000 lemmas. That sounds like a lot, but there are still cases where you'll encounter a word that doesn't have a definition.
<br><br>
The Firefox extension unfortunately doesn't survive restarts. This means you'll have to add it through the debugging page each time, although your settings and the dictionary will not be lost.
