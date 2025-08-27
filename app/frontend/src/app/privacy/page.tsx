import { BackButton } from "@/components/BackButton"

export default function PrivacyPolicyPage() {
	return (
		<main className="min-h-screen py-8 px-4 md:px-8 lg:px-16 max-w-4xl mx-auto">
			<div className="space-y-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
					<p className="text-muted-foreground">最終更新日: 2025年5月17日</p>
				</div>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">1. 収集する情報</h2>
					<p>
						本サービスは、ユーザー登録時に学籍番号・ユーザー名・メールアドレス等の個人情報を収集します。また、サービス利用状況やアクセスログ等の情報も取得する場合があります。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">2. 利用目的</h2>
					<p>
						収集した情報は、本人確認、サービスの提供・運営・改善、ユーザーサポート、法令遵守のために利用します。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">3. 第三者提供</h2>
					<p>
						取得した個人情報は、法令に基づく場合を除き、本人の同意なく第三者に提供しません。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">4. 安全管理</h2>
					<p>
						個人情報の漏洩・滅失・毀損を防ぐため、適切な安全管理措置を講じます。ただし、自宅サーバー上で運用しているため、100%の安全性は保証できません。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">5. 免責事項</h2>
					<p>
						サーバートラブルや第三者による不正アクセス等、管理者の責に帰さない事由による情報漏洩等については責任を負いません。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">6. プライバシーポリシーの改定</h2>
					<p>
						本ポリシーは、必要に応じて予告なく改定することがあります。改定後は本ページに掲載した時点で効力を生じます。
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">7. お問い合わせ</h2>
					<p>
						個人情報の取扱いに関するご質問・ご相談は、下記メールアドレスまでご連絡ください。
					</p>
					<div className="bg-gray-100 rounded p-4 text-center text-lg font-mono select-all">
						contact@kuwaharu.com
					</div>
				</section>

				<div className="flex justify-center pt-8 pb-4">
					<BackButton fallback="/register" />
				</div>
			</div>
		</main>
	)
}
