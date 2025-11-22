export default function Loader({ text }) {

    return (
        <div className="min-h-screen bg-[#0E0B1C] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">{text || "Loading..."}</p>
            </div>
        </div>
    );
}