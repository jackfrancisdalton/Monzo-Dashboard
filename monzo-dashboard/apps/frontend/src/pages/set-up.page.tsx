const SetUpPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <p>TODO: content</p>
        </div>
    );
}

// show page if no tokens are defined
// content should be:
// - title: "Auth and sync your Monzo account"
// - description: " ensure you've added your credentials to the .env file before running the app"
// - when you click set up we'll redirect you to auth with monzo and then sync all of your data
// - the sync will only occur once, from then on we'll only sync data after the last transaction we have in the db
// - your monzo api tokesn will be encrypted and stored in database for security reasons and auto refresh once oauth set up
// - button to start sync


// provide button to connect to Monzo
// on return show a progressing loading spinner
// on completetion redirect to dashboard page
// on failure show error message

export default SetUpPage;
