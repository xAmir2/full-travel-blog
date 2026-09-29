import {Link} from "react-router-dom";

export function TermsOfServicePage() {
    return (<main className="container py-5">
        <div className="mx-auto" style={{maxWidth: "900px"}}>
            <div className="mb-5"><h1 className="mb-3 display-5 fw-bold"> Terms of Service </h1> <p
                className="small text-secondary"> Last updated: 29/09/2026 </p></div>
            <div className="text-secondary" style={{lineHeight: "1.75"}}> {/* Introduction */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 1. About These Terms </h2>
                    <p> Welcome to <strong>Explore & Share</strong> ("the Service"). These Terms of Service ("Terms")
                        govern your access to and use of Explore & Share. </p> <p className="mt-3"> By accessing or
                        using the Service, you agree to be bound by these Terms. If you do not agree with these Terms,
                        please do not use the Service. </p></section>
                {/* About the Service */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 2. About Explore & Share </h2>
                    <p> Explore & Share is a travel-focused website where users can view travel-related content and
                        interact with that content through comments, replies, likes, and other features made available
                        by the Service. </p> <p className="mt-3"> Public travel posts are currently created and managed
                        by the operator of Explore & Share and by users who have been specifically authorized by the
                        operator to contribute content. </p> <p className="mt-3"> The operator may change the features
                        and functionality of the Service over time. </p></section>
                {/* Eligibility */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 3. Eligibility </h2> <p> You
                    must provide accurate information when creating an account and must be legally permitted to use the
                    Service under the laws applicable to you. </p> <p className="mt-3"> If you are not legally permitted
                    to use the Service, you must not create or use an account. </p></section>
                {/* Account */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 4. Your Account </h2> <p> Some
                    features of the Service require you to create an account. </p> <p className="mt-3">You are
                    responsible for:</p>
                    <ul className="mt-2 ps-4">
                        <li>Providing accurate and up-to-date information;</li>
                        <li>Keeping your account credentials confidential;</li>
                        <li>Maintaining the security of your account;</li>
                        <li> All activity carried out through your account, unless the activity resulted from
                            circumstances outside your reasonable control.
                        </li>
                    </ul>
                    <p className="mt-3">You must not:</p>
                    <ul className="mt-2 ps-4">
                        <li>Create an account using another person's identity;</li>
                        <li>Impersonate another person;</li>
                        <li>Share your account credentials with others;</li>
                        <li> Attempt to gain unauthorized access to another user's account;</li>
                        <li> Use another person's account without permission.</li>
                    </ul>
                </section>
                {/* User interactions */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 5. User Interactions and
                    Comments </h2> <p>Registered users may be permitted to:</p>
                    <ul className="mt-2 ps-4">
                        <li>Comment on published posts;</li>
                        <li>Reply to other comments;</li>
                        <li>Like or otherwise react to content;</li>
                        <li> Participate in other interaction features made available by the Service.</li>
                    </ul>
                    <p className="mt-3"> You are responsible for the content of comments, replies, and other material
                        that you submit through the Service. </p> <p className="mt-3"> By submitting content, you
                        represent that: </p>
                    <ul className="mt-2 ps-4">
                        <li> The content does not knowingly violate applicable law;</li>
                        <li> The content does not knowingly infringe another person's intellectual-property or other
                            rights;
                        </li>
                        <li> You have the necessary rights or permissions to submit the content;</li>
                        <li> The content does not contain malicious software or code intended to interfere with the
                            Service.
                        </li>
                    </ul>
                </section>
                {/* Public posts */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 6. Public Posts and
                    Contributors </h2> <p> The operator currently controls the creation and publication of public travel
                    posts. </p> <p className="mt-3"> The operator may grant selected users or contributors permission to
                    create and publish posts. </p> <p className="mt-3"> Contributor permissions may be granted, changed,
                    suspended, or withdrawn by the operator. </p> <p className="mt-3"> Being granted contributor access
                    does not transfer ownership of Explore & Share or give a contributor ownership of the Service
                    itself. </p> <p className="mt-3"> Contributors are responsible for ensuring that material they
                    submit for publication is lawful and that they have the necessary rights and permissions to use that
                    material. </p></section>
                {/* Intellectual property */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 7. Content and Intellectual
                    Property </h2> <h3 className="mt-4 mb-3 h5 fw-semibold text-dark"> 7.1 Explore & Share
                    Content </h3> <p> Unless otherwise stated, the Explore & Share website, including its design,
                    branding, logos, software, original text, graphics, and other materials created by the operator, is
                    owned by or licensed to the operator and is protected by applicable intellectual-property laws. </p>
                    <p className="mt-3"> You may access and use this material for your personal, non-commercial use
                        through the Service. </p> <p className="mt-3"> You may not reproduce, redistribute, modify,
                        sell, publicly display, or commercially exploit protected material from the Service without
                        appropriate permission, except where permitted by applicable law. </p> <h3
                        className="mt-4 mb-3 h5 fw-semibold text-dark"> 7.2 Content Submitted by Users </h3> <p> You
                        retain ownership of original comments, replies, photographs, or other material that you submit
                        to the Service, to the extent that you have ownership rights in that material. </p> <p
                        className="mt-3"> By submitting content to the Service, you grant Explore & Share a
                        non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, and make that
                        content available as necessary to operate and provide the relevant features of the Service. </p>
                    <p className="mt-3"> This license does not transfer ownership of your content to Full Travel
                        Blog. </p></section>
                {/* Prohibited use */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 8. Prohibited Use </h2> <p>You
                    must not use the Service to:</p>
                    <ul className="mt-2 ps-4">
                        <li>Violate applicable laws or regulations;</li>
                        <li>Harass, threaten, stalk, or abuse other people;</li>
                        <li> Post or submit knowingly unlawful or infringing material;</li>
                        <li>Impersonate another person or entity;</li>
                        <li>Spam or repeatedly submit unwanted content;</li>
                        <li> Attempt to distribute malware, viruses, or other malicious software;</li>
                        <li> Attempt to gain unauthorized access to accounts, systems, databases, or administrative
                            functionality;
                        </li>
                        <li>Circumvent security or access controls;</li>
                        <li> Interfere with the normal operation of the Service;</li>
                        <li> Use automated systems to abuse, overload, scrape, or otherwise interfere with the Service
                            where such activity is not permitted;
                        </li>
                        <li> Manipulate likes, comments, or other engagement features through fraudulent or abusive
                            means;
                        </li>
                        <li> Use the Service for fraudulent or deceptive purposes.</li>
                    </ul>
                </section>
                {/* Moderation */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 9. Moderation and Removal of
                    Content </h2> <p> The operator may review, moderate, restrict, or remove comments, replies, posts,
                    or other content that: </p>
                    <ul className="mt-2 ps-4">
                        <li>Violates these Terms;</li>
                        <li>Violates applicable law;</li>
                        <li>Infringes the rights of another person;</li>
                        <li>Contains spam or malicious material;</li>
                        <li> Is abusive, threatening, or otherwise inappropriate for the Service;</li>
                        <li> Creates a security or operational risk.</li>
                    </ul>
                    <p className="mt-3"> The operator does not undertake an obligation to monitor every piece of content
                        submitted to the Service. </p></section>
                {/* Reporting */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 10. Reporting Content </h2>
                    <p> If you believe that content on the Service violates these Terms, applicable law, or your rights,
                        you may contact the operator at: </p> <p className="mt-3 fw-medium text-dark"> [CONTACT
                        EMAIL] </p> <p className="mt-3"> Where appropriate, please provide a description of the relevant
                        content, its location on the Service, the reason for your report, and any other information
                        reasonably necessary to assess the report. </p></section>
                {/* Third-party services */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 11. Third-Party Services </h2>
                    <p> The Service may use or interact with third-party services, hosting providers, content-delivery
                        services, or other external technologies. </p> <p className="mt-3"> Third-party services may
                        have their own terms and policies. Your use of those services may therefore be subject to their
                        respective terms. </p> <p className="mt-3"> Explore & Share is not responsible for the
                        independent operation, availability, or policies of third-party services. </p></section>
                {/* Availability */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 12. Availability of the
                    Service </h2> <p> The operator aims to keep Explore & Share available and functional but does not
                    guarantee that the Service will always be available without interruption, free from errors,
                    compatible with every device or browser, or free from security vulnerabilities. </p> <p
                    className="mt-3"> The Service may occasionally be unavailable because of maintenance, updates,
                    technical problems, hosting issues, security incidents, or circumstances outside the operator's
                    reasonable control. </p> <p className="mt-3"> The operator may modify, suspend, or discontinue
                    features of the Service where reasonably necessary. </p></section>
                {/* Travel information */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 13. Travel Information </h2>
                    <p> Travel information published on Explore & Share is provided for general informational and
                        entertainment purposes. </p> <p className="mt-3"> Travel conditions, prices, opening hours,
                        transportation schedules, entry requirements, accommodation availability, local regulations, and
                        other circumstances may change. </p> <p className="mt-3"> You should independently verify
                        important or time-sensitive information with relevant official or authoritative sources before
                        making travel decisions. </p> <p className="mt-3"> Explore & Share does not guarantee that
                        every piece of travel information published on the Service will always be complete, accurate,
                        current, or suitable for your particular circumstances. </p></section>
                {/* External links */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 14. External Links </h2>
                    <p> The Service may contain links to websites or services operated by third parties. </p> <p
                        className="mt-3"> These links may be provided for convenience or informational purposes. Full
                        Travel Blog does not control third-party websites and is not responsible for their content,
                        availability, security, terms, or privacy practices. </p></section>
                {/* Termination */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 15. Account Suspension and
                    Termination </h2> <p> You may stop using the Service at any time. </p> <p className="mt-3"> The
                    operator may suspend or terminate an account, restrict access to features, or remove content where
                    reasonably necessary, including when: </p>
                    <ul className="mt-2 ps-4">
                        <li>You materially violate these Terms;</li>
                        <li> Your activity creates a security or operational risk;</li>
                        <li> Your account is used for fraudulent or unlawful activity;</li>
                        <li> You repeatedly abuse other users or the Service.</li>
                    </ul>
                    <p className="mt-3"> Where appropriate and reasonably practicable, the operator may provide notice
                        before taking action. However, immediate action may be taken when necessary to protect users,
                        the Service, or the rights of others. </p></section>
                {/* Intellectual property complaints */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 16. Intellectual Property
                    Complaints </h2> <p> If you believe that material available through Explore & Share infringes your
                    intellectual-property rights, please contact: </p> <p className="mt-3 fw-medium text-dark"> [CONTACT
                    EMAIL] </p> <p className="mt-3"> Please provide sufficient information for the operator to identify
                    the material and understand the basis of your claim. </p></section>
                {/* Disclaimer */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 17. Disclaimer </h2> <p> To the
                    maximum extent permitted by applicable law, Explore & Share is provided on an "as available"
                    basis. </p> <p className="mt-3"> The operator does not guarantee that the Service or its content
                    will always be uninterrupted, error-free, complete, accurate, or current. </p> <p
                    className="mt-3"> Nothing in these Terms excludes or limits liability where such exclusion or
                    limitation is prohibited by applicable law. </p> <p className="mt-3"> Nothing in these Terms affects
                    any mandatory rights or protections that you may have under applicable consumer or other laws. </p>
                </section>
                {/* Limitation of liability */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 18. Limitation of
                    Liability </h2> <p> To the maximum extent permitted by applicable law, the operator will not be
                    responsible for losses or damages arising from your use of the Service where such liability may
                    lawfully be excluded or limited. </p> <p className="mt-3"> This includes, where legally
                    permitted: </p>
                    <ul className="mt-2 ps-4">
                        <li>Temporary unavailability of the Service;</li>
                        <li> Reliance on outdated or inaccurate travel information;</li>
                        <li>Third-party websites or services;</li>
                        <li>User-generated content;</li>
                        <li> Events outside the operator's reasonable control.</li>
                    </ul>
                    <p className="mt-3"> Nothing in these Terms excludes or limits liability that cannot legally be
                        excluded or limited under applicable law. </p></section>
                {/* Changes */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 19. Changes to These
                    Terms </h2> <p> The operator may update these Terms from time to time to reflect changes to the
                    Service, applicable requirements, or its operating practices. </p> <p className="mt-3"> When the
                    Terms are updated, the "Last updated" date at the beginning of this page will be changed. </p> <p
                    className="mt-3"> If a change is material, the operator may provide additional notice where
                    reasonably appropriate. </p> <p className="mt-3"> Your continued use of the Service after updated
                    Terms become effective constitutes acceptance of the updated Terms, to the extent permitted by
                    applicable law. </p></section>
                {/* Applicable law */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 20. Applicable Law and
                    Jurisdiction </h2> <p> These Terms are governed by the laws of Italy, except where mandatory
                    provisions of applicable law require otherwise. </p> <p className="mt-3"> Where legally permitted,
                    disputes relating to these Terms or the Service shall be subject to the competent courts of
                    Italy. </p> <p className="mt-3"> If you are a consumer, nothing in these Terms is intended to remove
                    or restrict any mandatory consumer rights or protections that apply to you under the law of your
                    place of residence. </p></section>
                {/* Severability */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 21. Severability </h2> <p> If
                    any provision of these Terms is found to be invalid, unlawful, or unenforceable, that provision
                    shall be interpreted or modified to the minimum extent necessary to make it enforceable where
                    legally possible. </p> <p className="mt-3"> The remaining provisions will continue to apply. </p>
                </section>
                {/* Contact */}
                <section className="mb-5"><h2 className="mb-3 h3 fw-semibold text-dark"> 22. Contact </h2> <p> If you
                    have questions, concerns, or requests relating to these Terms, you can contact: </p>
                    <div className="mt-3 rounded bg-light p-4"><p className="mb-1"><strong>Explore & Share</strong></p>
                        <p className="mb-1"> Operator: "" </p> <p className="mb-0"> Email: "" </p></div>
                </section>
                {/* Acceptance */}
                <section className="border-top pt-4"><p className="fw-medium text-dark"> By using Explore & Share, you
                    acknowledge that you have read and understood these Terms of Service and agree to comply with
                    them. </p></section>
                {/* Navigation */}
                <div className="border-top mt-4 pt-4"><Link to="/"
                                                            className="fw-medium text-primary text-decoration-none"> ←
                    Back to Explore & Share </Link></div>
            </div>
        </div>
    </main>);
}