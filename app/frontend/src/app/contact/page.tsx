
import { BackButton } from "@/components/BackButton"

export default function ContactPage() {
	return (
		<main className="min-h-screen py-8 px-4 md:px-8 lg:px-16 max-w-2xl mx-auto">
			<div className="space-y-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">お問い合わせ</h1>
					<p className="text-muted-foreground">本サービスに関するご連絡先</p>
				</div>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">重大なバグ・その他のお問い合わせ</h2>
					<p>
						サービスの不具合やセキュリティ上の重大な問題、その他のお問い合わせは、下記メールアドレスまでご連絡ください。
					</p>
					<div className="bg-gray-100 rounded p-4 text-center text-lg font-mono select-all">
						contact@kuwaharu.com
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">機能追加・改善要望</h2>
					<p>
						新機能のご要望や改善リクエストは、下記GitHubリポジトリのIssueからご連絡いただけると助かります。
					</p>
					<div className="bg-gray-100 rounded p-4 text-center">
						<a href="https://github.com/kuwaharu-git/school-app" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
							https://github.com/kuwaharu-git/school-app
						</a>
					</div>
				</section>

				<div className="flex justify-center pt-8 pb-4">
					<BackButton fallback="/" />
				</div>
			</div>
		</main>
	)
}
