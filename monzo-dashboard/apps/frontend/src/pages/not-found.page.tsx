import AppLayout from "../Layouts/AppLayout"

const NotFoundPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page Not Found</p>
        <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
      </div>
    </AppLayout>
  );
}

export default NotFoundPage;