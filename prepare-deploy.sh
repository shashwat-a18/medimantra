#!/bin/bash
# Build and prepare for deployment

echo "🚀 Preparing MediMitra for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Build client
echo "🏗️ Building client..."
cd client
npm run build
cd ..

# Run tests (optional)
echo "🧪 Running basic checks..."
cd server
node -c server.js && echo "✅ Server syntax check passed"
cd ../ml-server
python -c "import app; print('✅ ML server import check passed')" || echo "⚠️ ML server check failed"
cd ../chatbot
python -c "import simple_chatbot; print('✅ Chatbot import check passed')" || echo "⚠️ Chatbot check failed"
cd ..

echo "✅ Build preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Set up services on Render (server, ml-server, chatbot)"
echo "3. Deploy frontend on Vercel"
echo "4. Configure environment variables"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
