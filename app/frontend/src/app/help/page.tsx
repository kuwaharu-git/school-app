import { BackButton } from "@/components/BackButton"

export default function HelpPage() {
	return (
		<main className="min-h-screen py-8 px-4 md:px-8 lg:px-16 max-w-3xl mx-auto">
			<div className="space-y-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">ヘルプ・よくある質問</h1>
					<p className="text-muted-foreground">本サービスの使い方・FAQ</p>
				</div>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Q. サービスの利用には何が必要ですか？</h2>
					<p>
						ユーザー登録申請が必要です。申請後、管理者が承認するとログインして各機能をご利用いただけます。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Q. パスワードを忘れた場合は？</h2>
					<p>
						現在、パスワードリセット機能はありません。管理者までご連絡ください。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Q. プロジェクトやレビューの公開範囲は？</h2>
					<p>
						プロジェクトは「公開/非公開」を選択できます。公開の場合は未ログインユーザーも閲覧可能です。レビューは公開プロジェクトのみ誰でも閲覧できます。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Q. バグや要望はどこに連絡すればいい？</h2>
					<p>
						重大なバグや不具合は <span className="font-mono select-all">contact@kuwaharu.com</span> までご連絡ください。機能追加・改善要望は <a href="https://github.com/kuwaharu-git/school-app" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">GitHubリポジトリ</a> のIssueからお願いします。
					</p>
				</section>

				<div className="flex justify-center pt-8 pb-4">
					<BackButton fallback="/" />
				</div>
			</div>
		</main>
	)
}
