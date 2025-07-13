> **⚠ WARNING:** This application is still in active development. Use it at your own risk. Ensure you understand the implications of linking it to your Monzo account and handling sensitive financial data.


<details>
<summary style="font-size: 1.5em;">Upcoming Work</summary>

---
### Logging and Error handling
This applicaiton was developed focusing on feature development and common flows. 
Refactoring, focus and expansion of how errors and loggin are handled is a must for this repository. 

---

### Incremental Sync
The initial account sync is integrated, but the incremental sync still needs to be implemented.  
A potential solution could involve triggering the sync with a hook such as "on module init," but the exact approach is yet to be decided.

---

### UI Scalability
The current UI struggles to handle large data sets, making it difficult to read and analyze.  
A solution to improve scalability and readability for larger data sets is required.

### Additional Pages
Currently only the dashboard page is supported. I intend on adding support for a 

Account Page: showing useful information like account numbers, IBAN, etc... with easy copy buttons
Settings PAge: for setting themes, default accounts, default time ranges on dashboard, etc...


</details>
